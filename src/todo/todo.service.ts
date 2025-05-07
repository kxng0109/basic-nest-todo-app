import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Todo } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TodoService {
	constructor(private readonly prisma: PrismaService) {}

	async createTodo(data: Prisma.TodoCreateInput): Promise<Todo> {
		const todo = await this.findTodo(data.title);
		if(todo){
			throw new BadRequestException("Todo exists")
		}

		return this.prisma.todo.create({ data });
	}

	async getTodo(where: Prisma.TodoWhereUniqueInput): Promise<Todo> {
		const todo = await this.prisma.todo.findUnique({ where });
		if(!todo) throw new NotFoundException("Todo not found.");
		return todo;
	}

	async getTodos(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.TodoWhereUniqueInput;
		where?: Prisma.TodoWhereInput;
		orderBy?: Prisma.TodoOrderByWithRelationInput;
	}): Promise<Todo[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.todo.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
		});
	}

	async updateTodo(params: {
		where: Prisma.TodoWhereUniqueInput;
		data: Prisma.TodoUpdateInput;
	}): Promise<Todo> {
		const { where, data } = params;
		await this.getTodo(where);

		if(data?.title){
			const todo = await this.findTodo(data.title);
			if(todo){
				throw new BadRequestException("Todo exists")
			}
		}
		
		return this.prisma.todo.update({ where, data });
	}

	async deleteTodo(where: Prisma.TodoWhereUniqueInput): Promise<Todo> {
		await this.getTodo(where);
		return this.prisma.todo.delete({ where });
	}

	private async findTodo(title){
		const todo = await this.prisma.todo.findUnique({
			where: {
				title
			}
		});
		return todo;
	}
}
