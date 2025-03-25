import { z } from "zod";

export const ErrorSchema = z.object({
  code: z.number().int(),
  message: z.string(),
  details: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional(),
});

export type Error = z.infer<typeof ErrorSchema>;

export const PaginationMetaSchema = z.object({
  totalItems: z.number().int(),
  itemsPerPage: z.number().int(),
  currentPage: z.number().int(),
  totalPages: z.number().int(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const UserCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type UserCredentials = z.infer<typeof UserCredentialsSchema>;

export const UserSignupSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const UserBasicSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string().email(),
});

export type UserSignup = z.infer<typeof UserSignupSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
  user: UserBasicSchema,
});

export type UserBasic = z.infer<typeof UserBasicSchema>;

export const UserSchema = z.any();

export type User = z.infer<typeof UserSchema>;

export const UserUpdateInputSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;

export const UserSettingSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type UserSetting = z.infer<typeof UserSettingSchema>;

export const UserSettingInputSchema = z.object({
  theme: z.string().optional(),
  notificationEnabled: z.boolean().optional(),
  language: z.string().optional(),
});

export type UserSettingInput = z.infer<typeof UserSettingInputSchema>;

export const BookSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Book = z.infer<typeof BookSchema>;

export const BookInputSchema = z.object({
  name: z.string(),
});

export type BookInput = z.infer<typeof BookInputSchema>;

export const CategorySchema = z.object({
  id: z.number().int(),
  bookId: z.number().int(),
  categoryName: z.string(),
  incomeFlg: z.boolean(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryInputSchema = z.object({
  categoryName: z.string(),
  incomeFlg: z.boolean(),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export const SubcategorySchema = z.object({
  id: z.number().int(),
  categoryId: z.number().int(),
  subcategoryName: z.string(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Subcategory = z.infer<typeof SubcategorySchema>;

export const SubcategoryInputSchema = z.object({
  subcategoryName: z.string(),
});

export type SubcategoryInput = z.infer<typeof SubcategoryInputSchema>;

export const ScheduleSchema = z.object({
  id: z.number().int(),
  bookId: z.number().int(),
  categoryId: z.number().int().optional(),
  subcategoryId: z.number().int().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  title: z.string(),
  remarks: z.string().optional(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

export const ScheduleInputSchema = z.object({
  categoryId: z.number().int().optional(),
  subcategoryId: z.number().int().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  title: z.string(),
  remarks: z.string().optional(),
});

export type ScheduleInput = z.infer<typeof ScheduleInputSchema>;

export const WorkSchema = z.object({
  id: z.number().int(),
  bookId: z.number().int(),
  workName: z.string(),
  hourlyPay: z.number().optional(),
  unitPrice: z.number().optional(),
  company: z.string(),
  agent: z.string().optional(),
  remarks: z.string().optional(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Work = z.infer<typeof WorkSchema>;

export const WorkInputSchema = z.object({
  workName: z.string(),
  hourlyPay: z.number().optional(),
  unitPrice: z.number().optional(),
  company: z.string(),
  agent: z.string().optional(),
  remarks: z.string().optional(),
});

export type WorkInput = z.infer<typeof WorkInputSchema>;

export const NoticeSchema = z.object({
  id: z.number().int(),
  bookId: z.number().int(),
  disUserId: z.number().int().optional(),
  disRole: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  delDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  remarks: z.string().optional(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type Notice = z.infer<typeof NoticeSchema>;

export const NoticeInputSchema = z.object({
  disUserId: z.number().int().optional(),
  disRole: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  remarks: z.string().optional(),
});

export type NoticeInput = z.infer<typeof NoticeInputSchema>;

export const NoticeReadSchema = z.object({
  id: z.number().int(),
  noticeId: z.number().int(),
  userId: z.number().int(),
  delFlg: z.boolean(),
  updateCnt: z.number().int(),
  updateTime: z.string().datetime(),
  updateUserId: z.number().int().optional(),
  createTime: z.string().datetime(),
  createUserId: z.number().int().optional(),
});

export type NoticeRead = z.infer<typeof NoticeReadSchema>;

export const StatisticsResponseSchema = z.object({
  totalSchedules: z.number().int().optional(),
  totalCategories: z.number().int().optional(),
  totalWorks: z.number().int().optional(),
  incomeStats: z
    .object({
      totalIncome: z.number().optional(),
      averageIncome: z.number().optional(),
    })
    .optional(),
  scheduleDistribution: z.object({}).optional(),
  monthlyStats: z
    .array(
      z.object({
        month: z.string().optional(),
        scheduleCount: z.number().int().optional(),
        income: z.number().optional(),
      })
    )
    .optional(),
});

export type StatisticsResponse = z.infer<typeof StatisticsResponseSchema>;

export const ResumeResponseSchema = z.object({
  userId: z.number().int().optional(),
  userName: z.string().optional(),
  works: z.array(WorkSchema).optional(),
  totalExperience: z
    .object({
      years: z.number().int().optional(),
      months: z.number().int().optional(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
});

export type ResumeResponse = z.infer<typeof ResumeResponseSchema>;

export const schemas = {
  Error: ErrorSchema,
  PaginationMeta: PaginationMetaSchema,
  UserCredentials: UserCredentialsSchema,
  UserSignup: UserSignupSchema,
  AuthResponse: AuthResponseSchema,
  UserBasic: UserBasicSchema,
  User: UserSchema,
  UserUpdateInput: UserUpdateInputSchema,
  UserSetting: UserSettingSchema,
  UserSettingInput: UserSettingInputSchema,
  Book: BookSchema,
  BookInput: BookInputSchema,
  Category: CategorySchema,
  CategoryInput: CategoryInputSchema,
  Subcategory: SubcategorySchema,
  SubcategoryInput: SubcategoryInputSchema,
  Schedule: ScheduleSchema,
  ScheduleInput: ScheduleInputSchema,
  Work: WorkSchema,
  WorkInput: WorkInputSchema,
  Notice: NoticeSchema,
  NoticeInput: NoticeInputSchema,
  NoticeRead: NoticeReadSchema,
  StatisticsResponse: StatisticsResponseSchema,
  ResumeResponse: ResumeResponseSchema,
};
