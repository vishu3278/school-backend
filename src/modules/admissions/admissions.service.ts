import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Grade } from '../grades/grade.entity';
import { Student } from '../students/student.entity';
import { UserRole } from '../users/user-role.enum';
import { CreateAdmissionApplicationDto } from './dto/create-admission-application.dto';
import { UpdateAdmissionApplicationDto } from './dto/update-admission-application.dto';
import {
  AdmissionApplication,
  AdmissionStatus,
} from './admission-application.entity';

async function generateApplicationNumber(
  repository: Repository<AdmissionApplication>,
): Promise<string> {
  const now = new Date();
  const prefix = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
  const rows = await repository
    .createQueryBuilder('application')
    .where('application.application_no LIKE :prefix', { prefix: `${prefix}%` })
    .select('application.application_no', 'applicationNo')
    .getRawMany<{ applicationNo: string }>();
  const maxNumber = rows.reduce((max, row) => {
    const value = Number.parseInt(row.applicationNo.replace(prefix, ''), 10);
    return Math.max(max, Number.isNaN(value) ? 0 : value);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
}

function allowedAcademicYears(): string[] {
  const now = new Date();
  const currentStartYear = now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);
  return [-2, -1, 0, 1].map((offset) => {
    const year = currentStartYear + offset;
    return `${year}-${String(year + 1).slice(-2)}`;
  });
}

const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<AdmissionStatus, AdmissionStatus[]>
> = {
  [AdmissionStatus.DRAFT]: [AdmissionStatus.SUBMITTED],
  [AdmissionStatus.SUBMITTED]: [AdmissionStatus.UNDER_REVIEW],
  [AdmissionStatus.UNDER_REVIEW]: [
    AdmissionStatus.APPROVED,
    AdmissionStatus.REJECTED,
    AdmissionStatus.WAITLISTED,
  ],
  [AdmissionStatus.WAITLISTED]: [
    AdmissionStatus.APPROVED,
    AdmissionStatus.REJECTED,
  ],
};

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(AdmissionApplication)
    private readonly applicationRepository: Repository<AdmissionApplication>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<AdmissionApplication[]> {
    return this.applicationRepository.find({
      relations: { requestedGrade: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AdmissionApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: { requestedGrade: true },
    });
    if (!application) throw new NotFoundException('Admission application not found');
    return application;
  }

  async create(dto: CreateAdmissionApplicationDto): Promise<AdmissionApplication> {
    if (!allowedAcademicYears().includes(dto.academicYear)) {
      throw new BadRequestException('Academic year must be within the allowed range');
    }

    const requestedGrade = await this.gradeRepository.findOne({
      where: { id: dto.requestedGradeId },
    });
    if (!requestedGrade) throw new NotFoundException('Requested grade not found');

    const application = this.applicationRepository.create({
      applicationNo: await generateApplicationNumber(this.applicationRepository),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender || null,
      fatherName: dto.fatherName?.trim() || null,
      motherName: dto.motherName?.trim() || null,
      studentAadharNo: dto.studentAadharNo?.trim() || null,
      fatherAadharNo: dto.fatherAadharNo.trim(),
      motherAadharNo: dto.motherAadharNo.trim(),
      fatherOccupation: dto.fatherOccupation?.trim() || null,
      motherOccupation: dto.motherOccupation?.trim() || null,
      religion: dto.religion || null,
      address: dto.address?.trim() || null,
      phone1: dto.phone1?.trim() || null,
      phone2: dto.phone2?.trim() || null,
      email: dto.email?.trim().toLowerCase() || null,
      previousSchool: dto.previousSchool?.trim() || null,
      previousGrade: dto.previousGrade?.trim() || null,
      previousResult: dto.previousResult?.trim() || null,
      academicYear: dto.academicYear.trim(),
      requestedGrade,
      birthCertificateReceived: dto.birthCertificateReceived ?? false,
      transferCertificateReceived: dto.transferCertificateReceived ?? false,
      previousMarksheetReceived: dto.previousMarksheetReceived ?? false,
      photosReceived: dto.photosReceived ?? false,
      // Every application begins as a draft. Status changes are handled only
      // through the validated admin update workflow.
      status: AdmissionStatus.DRAFT,
    });
    return this.applicationRepository.save(application);
  }

  async update(
    id: string,
    dto: UpdateAdmissionApplicationDto,
    role: UserRole,
  ): Promise<AdmissionApplication> {
    const application = await this.findOne(id);

    const requestedStatus = dto.status;

    if (
      application.status === AdmissionStatus.APPROVED ||
      application.status === AdmissionStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        'Approved and cancelled admission applications are read-only',
      );
    }

    if (role === UserRole.TEACHER) {
      if (application.status !== AdmissionStatus.DRAFT) {
        throw new ForbiddenException(
          'Teachers can edit an admission application only while it is a draft',
        );
      }

      if (
        requestedStatus !== undefined &&
        requestedStatus !== AdmissionStatus.DRAFT &&
        requestedStatus !== AdmissionStatus.SUBMITTED
      ) {
        throw new ForbiddenException(
          'Teachers can only submit a draft admission application',
        );
      }
    }

    if (dto.academicYear && !allowedAcademicYears().includes(dto.academicYear)) {
      throw new BadRequestException('Academic year must be within the allowed range');
    }

    if (dto.requestedGradeId) {
      const requestedGrade = await this.gradeRepository.findOne({
        where: { id: dto.requestedGradeId },
      });
      if (!requestedGrade) throw new NotFoundException('Requested grade not found');
      application.requestedGrade = requestedGrade;
    }

    if (dto.firstName !== undefined) application.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) application.lastName = dto.lastName.trim();
    if (dto.dateOfBirth !== undefined) application.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) application.gender = dto.gender || null;
    if (dto.fatherName !== undefined) application.fatherName = dto.fatherName?.trim() || null;
    if (dto.motherName !== undefined) application.motherName = dto.motherName?.trim() || null;
    if (dto.studentAadharNo !== undefined) application.studentAadharNo = dto.studentAadharNo?.trim() || null;
    if (dto.fatherAadharNo !== undefined) application.fatherAadharNo = dto.fatherAadharNo.trim();
    if (dto.motherAadharNo !== undefined) application.motherAadharNo = dto.motherAadharNo.trim();
    if (dto.fatherOccupation !== undefined) application.fatherOccupation = dto.fatherOccupation?.trim() || null;
    if (dto.motherOccupation !== undefined) application.motherOccupation = dto.motherOccupation?.trim() || null;
    if (dto.religion !== undefined) application.religion = dto.religion || null;
    if (dto.address !== undefined) application.address = dto.address?.trim() || null;
    if (dto.phone1 !== undefined) application.phone1 = dto.phone1?.trim() || null;
    if (dto.phone2 !== undefined) application.phone2 = dto.phone2?.trim() || null;
    if (dto.email !== undefined) application.email = dto.email?.trim().toLowerCase() || null;
    if (dto.previousSchool !== undefined) application.previousSchool = dto.previousSchool?.trim() || null;
    if (dto.previousGrade !== undefined) application.previousGrade = dto.previousGrade?.trim() || null;
    if (dto.previousResult !== undefined) application.previousResult = dto.previousResult?.trim() || null;
    if (dto.academicYear !== undefined) application.academicYear = dto.academicYear.trim();
    if (dto.birthCertificateReceived !== undefined) application.birthCertificateReceived = dto.birthCertificateReceived;
    if (dto.transferCertificateReceived !== undefined) application.transferCertificateReceived = dto.transferCertificateReceived;
    if (dto.previousMarksheetReceived !== undefined) application.previousMarksheetReceived = dto.previousMarksheetReceived;
    if (dto.photosReceived !== undefined) application.photosReceived = dto.photosReceived;
    await this.applicationRepository.save(application);

    return requestedStatus !== undefined && requestedStatus !== application.status
      ? this.updateStatus(id, requestedStatus)
      : application;
  }

  private async updateStatus(
    id: string,
    nextStatus: AdmissionStatus,
  ): Promise<AdmissionApplication> {
    return this.dataSource.transaction(async (manager) => {
      const applications = manager.getRepository(AdmissionApplication);
      const students = manager.getRepository(Student);
      // PostgreSQL cannot apply FOR UPDATE to the nullable side of an outer
      // join. Lock the application row first, then load its relations while
      // the transaction still owns that lock.
      const application = await applications.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!application) {
        throw new NotFoundException('Admission application not found');
      }

      const permitted = ALLOWED_STATUS_TRANSITIONS[application.status] ?? [];
      if (!permitted.includes(nextStatus)) {
        throw new BadRequestException(
          `Cannot change admission status from ${application.status} to ${nextStatus}`,
        );
      }

      const applicationRelations = await applications.findOne({
        where: { id },
        relations: { requestedGrade: true, student: true },
      });

      if (!applicationRelations) {
        throw new NotFoundException('Admission application not found');
      }

      if (nextStatus === AdmissionStatus.APPROVED) {
        if (applicationRelations.student) {
          throw new ConflictException('An approved admission already has a student');
        }

        const student = students.create({
          admissionNo: await generateStudentAdmissionNumber(students),
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender,
          phone: application.phone1,
          phone2: application.phone2,
          email: application.email,
          isActive: false,
          motherName: application.motherName,
          fatherName: application.fatherName,
          aadharNo: application.studentAadharNo,
          fatherAadharNo: application.fatherAadharNo,
          motherAadharNo: application.motherAadharNo,
          fatherOccupation: application.fatherOccupation,
          motherOccupation: application.motherOccupation,
          religion: application.religion,
          address: application.address,
          grade: applicationRelations.requestedGrade,
          section: null,
        });
        application.student = await students.save(student);
      }

      application.status = nextStatus;
      return applications.save(application);
    });
  }
}

async function generateStudentAdmissionNumber(
  repository: Repository<Student>,
): Promise<string> {
  const now = new Date();
  const prefix = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
  const rows = await repository
    .createQueryBuilder('student')
    .where('student.admission_no LIKE :prefix', { prefix: `${prefix}%` })
    .select('student.admission_no', 'admissionNo')
    .getRawMany<{ admissionNo: string }>();
  const maxNumber = rows.reduce((max, row) => {
    const value = Number.parseInt(row.admissionNo.replace(prefix, ''), 10);
    return Math.max(max, Number.isNaN(value) ? 0 : value);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
}
