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
