-- AlterTable
ALTER TABLE `users` ADD COLUMN `about` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `interests` VARCHAR(191) NULL,
    ADD COLUMN `jobLove` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `manager` VARCHAR(191) NULL,
    ADD COLUMN `mobile` VARCHAR(191) NULL,
    ADD COLUMN `profileImage` VARCHAR(191) NULL;

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
ALTER TABLE `SalaryInfo` ADD CONSTRAINT `SalaryInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certification` ADD CONSTRAINT `Certification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
