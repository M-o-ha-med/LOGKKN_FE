import {z} from 'zod';


export const emailSchema = z.object({
	email : z.string().email('Format email tidak valid').min(1, 'Email harus diisi !')
});


export const OTPSchema = z.object({
	otp : z.array(z.string().min( 1, 'OTP Harus diisi !').max(5, 'OTP yang dimasukkan tidak valid !')),
});



export const ResetPasswordSchema = z.object({
	newPassword : z.string().min(8 , 'Password harus sepanjang 8 kombinasi huruf dan angka' ).refine((val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val), {message: 'Password harus mengandung huruf dan angka'}),
	confirmNewPassword : z.string().min(8 , 'Password harus sepanjang 8 kombinasi huruf dan angka' ),

}).refine((data) => data.newPassword === data.confirmNewPassword , {
		message : "Password baru dan konfirmasi password tidak sama !",
		path : ["confirmNewPassword"],
		
});

