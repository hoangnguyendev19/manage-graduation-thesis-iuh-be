import Joi from 'joi';

export interface IBooleanValidate {
	value: any;
	required?: boolean;
}

export default class BooleanValidate {
	public static validate(props: IBooleanValidate) {

		if (props.required == false && props.value == undefined) return props.value;

		const schema = Joi.boolean().required();

		const { error, value } = schema.validate(props.value);

		if (error) throw new Error(error?.message.replace(/"/g, '').trim());

		return value;
	}
}
