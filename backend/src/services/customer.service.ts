import { randomUUID } from 'crypto';
import { AppError } from '../utils/AppError';
import { CustomerRepository } from '../repositories/customer.repository';
import { CustomerCreateInput, CustomerUpdateInput, CustomerQueryInput, FollowUpCreateInput } from '../dto/customer.dto';

export class CustomerService {
  private customerRepo: CustomerRepository;

  constructor() {
    this.customerRepo = new CustomerRepository();
  }

  async list(input: CustomerQueryInput) {
    return this.customerRepo.list({ page: input.page, limit: input.limit, search: input.search });
  }

  async getById(id: string) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);

    const notes = await this.customerRepo.listNotes(id);
    return { ...customer, followUpNotes: notes };
  }

  async create(input: CustomerCreateInput, createdBy: string) {
    const customer = await this.customerRepo.create({
      id: randomUUID(),
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      businessName: input.businessName,
      gstNumber: input.gstNumber ?? null,
      customerType: input.customerType,
      address: input.address,
      status: input.status ?? 'LEAD',
      followUpDate: input.followUpDate ?? null,
      createdAt: new Date()
    } as any);

    await this.customerRepo.createNote(customer.id, `Customer created by ${createdBy}`, createdBy);
    return customer;
  }

  async update(id: string, input: CustomerUpdateInput) {
    const customer = await this.customerRepo.update(id, input as any);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async remove(id: string) {
    const removed = await this.customerRepo.delete(id);
    if (!removed) throw new AppError('Customer not found', 404);
    return { deleted: true };
  }

  async addFollowUp(id: string, input: FollowUpCreateInput, createdBy: string) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);

    return this.customerRepo.createNote(id, input.note, createdBy);
  }

  async listFollowUps(id: string) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    return this.customerRepo.listNotes(id);
  }
}
