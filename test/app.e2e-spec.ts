import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateTodoDto, UpdateTodoDto } from '../src/todo/dto';

describe('Todo e2e test', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

		await app.init();
		await app.listen(3001);

		prisma = app.get(PrismaService);
		await prisma.todo.deleteMany();

		pactum.request.setBaseUrl('http://localhost:3001/todo');
	});

	afterAll(async () => {
		await app.close();
	});

	describe('Todo', () => {
		describe('GET /todo', () => {
			it('should return back an empty array', async () => {
				pactum.spec().get('/').expectStatus(200).expectBody([]);
			});
		});

		describe('POST /todo', () => {
			const dto: CreateTodoDto = {
				title: 'Learn NestJS',
				description: "Let's start with modules.",
			};
			it('Creates a todo', async () => {
				await pactum
					.spec()
					.post('/')
					.withBody(dto)
					.expectStatus(201)
					.stores('todoId', 'id');
			});

			it('should not allow duplicate titles', async () => {
				await pactum.spec().post('/').withBody(dto).expectStatus(400);
			});
		});

		describe('GET /todo:id', () => {
			it('Return a single todo', async () => {
				await pactum
					.spec()
					.get('/{id}')
					.withPathParams('id', '$S{todoId}')
					.expectStatus(200)
					.expectJsonMatch({ id: '$S{todoId}' });
			});
		});

		describe('GET /todo', () => {
			it('return an array of todo', async () => {
				await pactum.spec().get('/').expectStatus(200).expectJsonLength(1);
			});
		});

		describe('PATCH /todo:id', () => {
			const dto: UpdateTodoDto = {
				description: 'Start with services and controllers.',
				completed: true,
			};

			it('return a todo with updated values', async () => {
				await pactum
					.spec()
					.patch('/{id}')
					.withPathParams('id', '$S{todoId}')
					.withBody(dto)
					.expectStatus(200);
			});
		});

		describe('DELETE /todo:id', () => {
			it('delete a todo', async () => {
				await pactum
					.spec()
					.delete('/{id}')
					.withPathParams('id', '$S{todoId}')
					.expectStatus(204);
			});
		});
	});
});
