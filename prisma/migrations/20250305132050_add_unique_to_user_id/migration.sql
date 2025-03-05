-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `lineuid` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_lineuid_key`(`lineuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignsname` VARCHAR(191) NOT NULL,
    `lineId` VARCHAR(191) NULL,
    `transactionID` VARCHAR(191) NULL,
    `lineName` VARCHAR(191) NOT NULL,
    `form` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `details` VARCHAR(191) NULL,
    `detailsname` VARCHAR(191) NULL,
    `detailsbirthdate` VARCHAR(191) NULL,
    `detailsbirthmonth` VARCHAR(191) NULL,
    `detailsbirthyear` VARCHAR(191) NULL,
    `detailsbirthtime` VARCHAR(191) NULL,
    `detailsbirthconstellation` VARCHAR(191) NULL,
    `detailsbirthage` VARCHAR(191) NULL,
    `detailstext` VARCHAR(191) NULL,
    `detailswish` VARCHAR(191) NULL,
    `slip` VARCHAR(191) NULL,
    `url_img` VARCHAR(191) NULL,
    `qr_url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `notify` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `campaignsid` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Line_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `picture_url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Line_users_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `price` INTEGER NULL,
    `respond` VARCHAR(191) NULL,
    `stock` INTEGER NULL,
    `detailsname` VARCHAR(191) NULL DEFAULT 'false',
    `detailsbirthdate` VARCHAR(191) NULL DEFAULT 'false',
    `detailstext` VARCHAR(191) NULL DEFAULT 'false',
    `detailswish` VARCHAR(191) NULL DEFAULT 'false',
    `campaign_img` VARCHAR(191) NULL,
    `campaign_imgpush` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `topicId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campaign_transactions` ADD CONSTRAINT `Campaign_transactions_campaignsid_fkey` FOREIGN KEY (`campaignsid`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
