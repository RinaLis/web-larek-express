import {
  model, Schema, Model, Document,
} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { ACCESS_TOKEN, REFRESH_TOKEN, BCRYPT_SALT } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

interface UserMethods {
    generateAccessToken (): string;
    generateRefreshToken (): Promise<string>
}

interface UserModel extends Model<IUser, {}, UserMethods> {
  findByCredentials: (
    email: string,
    password: string
  ) => Promise<Document<unknown, {}, IUser> & UserMethods>
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    select: false,
  },
  tokens: [
    {
      token: {
        type: String,
        select: false,
      },
    },
  ],
}, { versionKey: false });

userSchema.set('toJSON', {
  virtuals: true,
  transform(_, ret) {
    const { name, email } = ret;

    return { name, email };
  },
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, BCRYPT_SALT);
    }
    next();
  } catch {
    next(new Error());
  }
});

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) { throw new UnauthorizedError('Неправильная почта или пароль'); }
  const passwdMatch = await bcrypt.compare(password, user.password);
  if (!passwdMatch) { throw new UnauthorizedError('Неправильная почта или пароль'); }
  return user;
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    { _id: this._id },
    `${ACCESS_TOKEN.secret}`,
    { expiresIn: `${ACCESS_TOKEN.expiry}` as StringValue },
  );

  return accessToken;
};

userSchema.methods.generateRefreshToken = async function () {
  const refreshToken = jwt.sign(
    { _id: this._id },
    `${REFRESH_TOKEN.secret}`,
    { expiresIn: `${REFRESH_TOKEN.expiry}` as StringValue },
  );

  this.tokens.push({ token: refreshToken });
  await this.save();

  return refreshToken;
};

export default model<IUser, UserModel>('User', userSchema);
