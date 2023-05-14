import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { CreateTodoDto, EditTodoDto } from '../src/todo/dto';

describe('App e2e', () => {
  let testApp: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testApp = moduleReference.createNestApplication();
    testApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await testApp.init();
    await testApp.listen(5000);
    prisma = testApp.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:5000');
  });

  afterAll(() => {
    testApp.close();
  });

  describe('Auth', () => {
    describe('Registration', () => {
      it('should successfully create a new user with valid input', () => {
        const dto: AuthDto = {
          email: 'test+user@mail.com',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains('access_token');
      });

      it('should fail to register a user when the email is missing', () => {
        const dto: AuthDto = {
          email: '',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(400)
          .expectBodyContains('error');
      });

      it('should fail to register a user when the password is missing', () => {
        const dto: AuthDto = {
          email: 'test+user2@mail.com',
          password: '',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(400)
          .expectBodyContains('error');
      });

      it('should fail to register a user when no request body is provided', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .expectStatus(400)
          .expectBodyContains('error');
      });

      it('should fail to register a user when the email is already in use', () => {
        const dto: AuthDto = {
          email: 'test+user@mail.com',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(403)
          .expectBodyContains('error');
      });
    });

    describe('Login', () => {
      it('should successfully log in a user with valid credentials', () => {
        const dto: AuthDto = {
          email: 'test+user@mail.com',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('access_token')
          .stores('userAccessToken', 'access_token');
      });

      it('should fail to log in when the user does not exist', () => {
        const dto: AuthDto = {
          email: 'test+userf@mail.com',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(403)
          .expectBodyContains('error');
      });

      it('should fail to log in when the user exists but the password is incorrect', () => {
        const dto: AuthDto = {
          email: 'test+user@mail.com',
          password: 'wrongPass',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(403)
          .expectBodyContains('error');
      });

      it('should fail to log in when the password is not provided', () => {
        const dto: AuthDto = {
          email: 'test+user@mail.com',
          password: '',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(400)
          .expectBodyContains('error');
      });

      it('should fail to log in when the email is not provided', () => {
        const dto: AuthDto = {
          email: '',
          password: '2jh!5okSlaTS28',
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(400)
          .expectBodyContains('error');
      });
    });
  });

  describe('Todo', () => {
    describe('List Todos', () => {
      it('should get empty array of todos as none exist', () => {
        return pactum
          .spec()
          .get('/todos')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Todo', () => {
      it('should create a todo', () => {
        const dto: CreateTodoDto = {
          title: 'Clean room',
          due_date: `${new Date().toISOString()}`,
        };
        return pactum
          .spec()
          .post('/todos')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('todo_id', 'id');
      });

      it('should get array of todos with one entry', () => {
        return pactum
          .spec()
          .get('/todos')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Todo by id', () => {
      it('should gat a single todo by id', () => {
        return pactum
          .spec()
          .get('/todos/{id}')
          .withPathParams('id', '$S{todo_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{todo_id}');
      });
    });

    describe('Update Todo', () => {
      it('should update a single todo', () => {
        const dto: EditTodoDto = {
          title: 'Clean room now',
          due_date: `${new Date().toISOString()}`,
          completed: true,
        };
        return pactum
          .spec()
          .patch('/todos/{id}')
          .withPathParams('id', '$S{todo_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.due_date)
          .expectBodyContains(['home']);
      });
    });

    describe('Delete Todo', () => {
      it('should gat a single todo by id', () => {
        return pactum
          .spec()
          .delete('/todos/{id}')
          .withPathParams('id', '$S{todo_id}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204)
      });

      it('should get empty array of todos as none exist', () => {
        return pactum
          .spec()
          .get('/todos')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
