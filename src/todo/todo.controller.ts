import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { Todo as TodoModel } from 'generated/prisma';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
	constructor(private readonly todoService: TodoService) {}

	@Post()
	async createTodo(@Body() createTodoDto: CreateTodoDto): Promise<TodoModel> {
		return await this.todoService.createTodo(createTodoDto);
	}

	@Get()
	async getTodos(): Promise<TodoModel[]> {
		return this.todoService.getTodos({});
	}

	@Get(':id')
	async getTodo(@Param('id', ParseIntPipe) id: number): Promise<TodoModel> {
		return await this.todoService.getTodo({ id });
	}

	@Patch(':id')
	async updateTodo(
		@Body() updateTodoDto: UpdateTodoDto,
		@Param('id', ParseIntPipe) id: number,
	): Promise<TodoModel> {
		return this.todoService.updateTodo({ where: {id}, data: updateTodoDto});
	}

	@Delete(':id')
	async deleteTodo(@Param('id', ParseIntPipe) id: number) {
		return this.todoService.deleteTodo({ id });
	}
}
