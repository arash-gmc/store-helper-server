import { InternalServerError, NotAcceptableError } from '../utils/v1/errors';
import Env from './env.config';
import Axios from 'axios';

export interface PlaceholderParameter {
	Name: string;
	Value: string;
}

interface SendVerifyCodeResponse {
	MessageId: number;
	Cost: number;
}

interface SendVerifyCodeResponse {
	status: number;
	message: string;
	data: number[];
}

const apiKey = Env.SMSIR_ACCESS_KEY ?? null;
const lineNumber = Number(Env.SMSIR_LINE_NUMBER);
if (
	!apiKey ||
	typeof apiKey !== 'string' ||
	!lineNumber ||
	typeof lineNumber !== 'number'
) {
	throw new NotAcceptableError(
		'Sms service apikey and linenumber are required',
		{
			resource: 'SmsConfig',
		}
	);
}
const smsClient = Axios.create({
	baseURL: 'https://api.sms.ir/v1',
	headers: {
		'X-API-KEY': apiKey,
	},
});

async function SendVerifyCode(
	mobile: string,
	templateId: number,
	parameters: PlaceholderParameter[]
): Promise<SendVerifyCodeResponse> {
	const response = await smsClient.post('/send/verify', {
		mobile: mobile,
		templateId: templateId,
		parameters: parameters,
	});
	if (response.data.status !== 1) {
		throw new InternalServerError(
			`Status Code returned from web service was no success`,
			{
				resource: `SmsConfig@sendVerifyCode`,
				meta: {
					data: response.data.data,
				},
			}
		);
	}
	return response.data.data;
}

async function sendTextSms(
	mobiles: string[],
	messageTexts: string[],
	senddatetime: Date | null
) {
	const response = await smsClient.post('/send/likeToLike', {
		lineNumber,
		messageTexts: messageTexts,
		mobiles: mobiles,
		senddatetime: senddatetime ?? null,
	});
	if (response.data.status !== 1) {
		throw new InternalServerError(
			`Status Code returned from web service was no success`,
			{
				resource: `SmsConfig@sendTextSms`,
				meta: {
					data: response.data.data,
				},
			}
		);
	}
	return response.data.data;
}

export const SmsTemplates = {
	LoginTemplate: 'LOGIN_TEMPLATE', // login template id from smsir
	OrderSubmittedTemplate: 'ORDER_SUBMITTED_TEMPLATE', // order info link smsir
	OrderCreatedTemplate: 'ORDER_CREATED_TEMPLATE',
} as const;

export type SmsTemplatesType = (typeof SmsTemplates)[keyof typeof SmsTemplates];

const SMS = { sendTextSms, SendVerifyCode };
export default SMS;
