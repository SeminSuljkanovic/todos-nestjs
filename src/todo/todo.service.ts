import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, EditTodoDto } from './dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {
  }

  async getTodos(user_id: number) {
    return await this.prisma.todo.findMany({
      where: {
        user_id,
      },
    });
  }
  async getTodoById(user_id: number, todo_id: number) {
    return await this.prisma.todo.findFirst({
      where: {
        id: todo_id,
        user_id,
      },
    });
  }

  async updateTodo(user_id: number, todo_id: number, dto: EditTodoDto) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todo_id,
      },
    });

    if (!todo || todo.user_id !== user_id) {
      throw new ForbiddenException('Access to resource denied');
    }

    return await this.prisma.todo.update({
      where: {
        id: todo_id,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTodo(user_id: number, todo_id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todo_id,
      },
    });

    if (!todo || todo.user_id !== user_id) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prisma.todo.delete({
      where: {
        id: todo_id,
      },
    });

    return {};
  }

  async createTodo(user_id: number, dto: CreateTodoDto) {
    return await this.prisma.todo.create({
      data: {
        user_id,
        ...dto,
      },
    });
  }
}
