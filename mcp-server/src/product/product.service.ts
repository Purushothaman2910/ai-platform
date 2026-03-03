import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

type Filters = {
  id?: number;
  name?: string;
  stock?: number;
  price?: number;
};

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  create(product: Product) {
    return this.repo.save(product);
  }

  getProductsByFilters(filters: Filters) {
    return this.repo.find({ where: filters });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }

  update(id: number, product: Product) {
    return this.repo.update(id, product);
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
