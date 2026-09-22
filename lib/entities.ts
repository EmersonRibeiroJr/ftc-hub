// Registro das entidades CRUD genéricas: esquema de validação (zod) + modelo do Prisma.
import { z } from 'zod';
import * as C from './constants';

const opt = z.preprocess((v) => (v === '' || v === undefined ? null : v), z.string().nullable());
const dateReq = z.preprocess((v) => (typeof v === 'string' && v ? new Date(`${v.slice(0, 10)}T12:00:00.000Z`) : v), z.date({ invalid_type_error: 'Data inválida', required_error: 'Informe a data' }));
const dateOpt = z.preprocess((v) => (typeof v === 'string' && v ? new Date(`${v.slice(0, 10)}T12:00:00.000Z`) : null), z.date().nullable());
const num = z.coerce.number({ invalid_type_error: 'Número inválido' }).default(0);
const int = z.coerce.number().int('Use um número inteiro').default(0);
const text = z.string().trim().default('');
const req = z.string().trim().min(1, 'Campo obrigatório');
const oneOf = (o: C.Option[]) => z.enum(o.map((x) => x.value) as [string, ...string[]]);

export type EntityDef = {
  delegate: string;
  schema: z.ZodTypeAny;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map?: (data: any, isUpdate: boolean) => any;
};

export const entities = {
  test: {
    delegate: 'test',
    schema: z.object({ date: dateReq, systemId: req, version: text, result: oneOf(C.TEST_RESULT), durationSec: num, videoUrl: text, notes: text }),
  },
  robotSystem: {
    delegate: 'robotSystem',
    schema: z.object({
      name: req, kind: oneOf([{ value: 'HARDWARE', label: '' }, { value: 'SOFTWARE', label: '' }]).default('HARDWARE'),
      version: text, status: oneOf(C.SYSTEM_STATUS), progress: int.pipe(z.number().min(0).max(100)), commits: int,
      ownerId: opt, cadUrl: text, githubUrl: text, docsUrl: text,
    }),
  },
  outreach: {
    delegate: 'outreach',
    schema: z.object({ event: req, city: text, date: dateReq, participants: int, photos: int, hours: num, sdgs: text, impact: text }),
  },
  sponsor: {
    delegate: 'sponsor',
    schema: z.object({ company: req, contact: text, stage: oneOf(C.SPONSOR_STAGE), amount: num, notes: text, contactAt: dateOpt, renewalAt: dateOpt }),
  },
  inventory: {
    delegate: 'inventory',
    schema: z.object({ category: req, name: req, quantity: int, minQuantity: int, supplier: text, price: num, location: text, code: text, imageUrl: text }),
  },
  calendarEvent: {
    delegate: 'calendarEvent',
    schema: z.object({ title: req, type: oneOf(C.EVENT_TYPE), date: dateReq, time: text, notes: text }),
  },
  meeting: {
    delegate: 'meeting',
    schema: z.object({ date: dateReq, summary: req, pending: text, attendeeIds: z.array(z.string()).default([]) }),
    map: ({ attendeeIds, ...rest }: { attendeeIds: string[] }, isUpdate: boolean) => ({
      ...rest,
      attendees: isUpdate ? { set: attendeeIds.map((id) => ({ id })) } : { connect: attendeeIds.map((id) => ({ id })) },
    }),
  },
  competition: {
    delegate: 'competition',
    schema: z.object({ name: req, date: dateReq, location: text }),
  },
} satisfies Record<string, EntityDef>;

export type ModelKey = keyof typeof entities;
