import { prisma } from './db';

export async function createContact(data: {
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  metadata?: any;
}) {
  return prisma.contact.create({
    data
  });
}

export async function getContact(id: string) {
  return prisma.contact.findUnique({
    where: { id }
  });
}

export async function createFile(data: {
  organizationId: string;
  name: string;
  url: string;
  uploadedById?: string;
}) {
  return prisma.file.create({
    data
  });
}
