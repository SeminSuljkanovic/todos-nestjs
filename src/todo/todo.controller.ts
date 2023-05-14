import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { TodoService } from './todo.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { CreateTodoDto, EditTodoDto } from './dto';

@UseGuards(JwtGuard)
@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {
  }
  @Get()
  getTodos(@GetUser('id') user_id: number) {
    return this.todoService.getTodos(user_id);
  }
  @Get(':id')
  getTodoById(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) todo_id: number,
  ) {
    return this.todoService.getTodoById(user_id, todo_id);
  }

  @Patch(':id')
  updateTodo(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) todo_id: number,
    @Body() dto: EditTodoDto,
  ) {
    return this.todoService.updateTodo(user_id, todo_id, dto);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTodo(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) todo_id: number,
  ) {
    return this.todoService.deleteTodo(user_id, todo_id);
  }

  @Post()
  createTodo(@GetUser('id') user_id: number, @Body() dto: CreateTodoDto) {
    return this.todoService.createTodo(user_id, dto);
  }
}
