-- AlterTable
ALTER TABLE `pedidos`
  ADD COLUMN `quantidade` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `enviadoAoEstoque` BOOLEAN NOT NULL DEFAULT false;