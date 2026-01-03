-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `companyLogo` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `loginId` VARCHAR(191) NULL,
    `role` ENUM('HR', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `mobile` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `manager` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `profileImage` VARCHAR(191) NULL,
    `about` VARCHAR(191) NULL,
    `jobLove` VARCHAR(191) NULL,
    `interests` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_loginId_key`(`loginId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE') NOT NULL DEFAULT 'PRESENT',
    `totalHours` DOUBLE NULL DEFAULT 0,
    `notes` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendances_userId_date_idx`(`userId`, `date`),
    INDEX `attendances_companyId_date_idx`(`companyId`, `date`),
    INDEX `attendances_status_idx`(`status`),
    UNIQUE INDEX `attendances_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_entries` (
    `id` VARCHAR(191) NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NULL,
    `duration` DOUBLE NULL,
    `location` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `attendanceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendance_entries_attendanceId_idx`(`attendanceId`),
    INDEX `attendance_entries_userId_checkIn_idx`(`userId`, `checkIn`),
    INDEX `attendance_entries_companyId_checkIn_idx`(`companyId`, `checkIn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `leaveType` ENUM('PAID', 'SICK', 'UNPAID', 'EXTRA') NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `remarks` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `adminComment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `leave_requests_userId_idx`(`userId`),
    INDEX `leave_requests_status_idx`(`status`),
    INDEX `leave_requests_startDate_idx`(`startDate`),
    INDEX `leave_requests_companyId_status_idx`(`companyId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_ledgers` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `leaveType` ENUM('PAID', 'SICK', 'UNPAID', 'EXTRA') NOT NULL,
    `change` INTEGER NOT NULL,
    `reason` ENUM('ACCRUAL', 'LEAVE_APPROVED', 'MANUAL_ADJUSTMENT') NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_ledgers_userId_leaveType_idx`(`userId`, `leaveType`),
    INDEX `leave_ledgers_companyId_idx`(`companyId`),
    INDEX `leave_ledgers_userId_idx`(`userId`),
    INDEX `leave_ledgers_referenceId_idx`(`referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalaryInfo` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `monthlyWage` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `yearlyWage` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `workingDaysPerWeek` INTEGER NULL,
    `breakTimeHours` DECIMAL(65, 30) NULL,
    `basicSalary` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `basicSalaryPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `houseRentAllowance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `hraPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `standardAllowance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `standardPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `performanceBonus` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `performancePercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `leaveTravelAllowance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `ltaPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `fixedAllowance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `fixedPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `employeePF` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `employeePFPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `employerPF` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `employerPFPercent` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `professionalTax` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalaryInfo_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certification` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_entries` ADD CONSTRAINT `attendance_entries_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `attendances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_entries` ADD CONSTRAINT `attendance_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_entries` ADD CONSTRAINT `attendance_entries_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_ledgers` ADD CONSTRAINT `leave_ledgers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_ledgers` ADD CONSTRAINT `leave_ledgers_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryInfo` ADD CONSTRAINT `SalaryInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certification` ADD CONSTRAINT `Certification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
