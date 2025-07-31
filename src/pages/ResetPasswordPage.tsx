import React, { useState , useRef} from "react";
import axios from "axios";
import Toast from '../components/Toast.tsx';
import {useNavigate} from "react-router-dom"
import {emailSchema ,OTPSchema ,ResetPasswordSchema} from '../utils/FormValidation/OTPSchema.tsx';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {z} from 'zod';


const ResetPasswordPage: React.FC = () => {
	
	const [message, setMessage] = useState('');
	const [state , setState] = useState<'Send_email' | 'Verify_OTP' | 'Reset_password' >('Send_email');


	const navigate = useNavigate();
	
	type emailFormData = z.infer<typeof emailSchema>;
	type OTPFormData = z.infer<typeof OTPSchema>;
	type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
	 
	const emailForm = useForm<emailFormData>({resolver : zodResolver(emailSchema)});
	const otpForm = useForm<OTPFormData>({resolver : zodResolver(OTPSchema)});
	const resetPasswordForm = useForm<ResetPasswordFormData>({resolver : zodResolver(ResetPasswordSchema)});
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	
	const handleOTPRequest = async (data : emailFormData) => {
		const email = data.email;
		const result = await axios.post(`${import.meta.env.VITE_API_URL}/auth/otp`, { email } , { withCredentials: true });
		try{
			
			if (result){
				Toast.fire({title : 'Kode OTP telah dikirim'  , icon : 'success'});
				setState('Verify_OTP');
			}
		}
		
		catch(err:any){
			const errorMessage = err.response?.data?.message || "Unexpected error occurred";
			Toast.fire({title : errorMessage , icon : "error"})
			setMessage(errorMessage);
		}

	};
	
	const handleOTPValidation = async (data : OTPFormData) => {

		
		const OTP = data.otp.join('');
		
		console.log(OTP);
		
		
		try{
			const result = await axios.post(`${import.meta.env.VITE_API_URL}/auth/otp/validate`, { OTP } , { withCredentials: true });
			if (result){
				setMessage('Kode OTP tervalidasi, harap cek inbox');
				Toast.fire({title : 'Kode OTP benar'  , icon : 'success'});
				setState('Reset_password');
				
			}

		
		}
		
		catch(err:any){
			const errorMessage = err.response?.data?.message || "Unexpected error occurred";
			Toast.fire({title : errorMessage , icon : "error"})
			setMessage(errorMessage);
		}

	};
	
	

	
	const handleResetPasswordRequest = async (data : ResetPasswordFormData) => {
		
		const email = emailForm.getValues('email');
		const password = data.newPassword;
		console.log(password);
		

		
		try{
			await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset` , {email  , password} , {withCredentials : true});
			Toast.fire({title : 'Password Berhasil Di reset'  , icon : 'success'});

		}
		
		
		catch(err : any){
			const errorMessage = err.response?.data?.message || "Unexpected error occurred";
			Toast.fire({title : errorMessage , icon : "error"})
			setMessage(errorMessage);
			
		
		}
		
		finally{
			navigate('/admin/login');
		}
		
	
	
	
	
	}
	


	return (
		<div className="py-[10rem]">
			<div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm h-[35rem] lg:max-w-4xl">

				
				<div className="flex flex-col justify-center w-full p-8">
					<h5 className="text-blue-500 text-center text-4xl m-4 font-semibold">Reset Password</h5>
					
										
					{state === 'Send_email'  && (
					
						<form onSubmit={emailForm.handleSubmit(handleOTPRequest)} className='object-center'>
							<div className="mt-2">
								<label className="block text-gray-700 text-sm font-bold mb-4 font-barlow">Masukkan Email dari akun</label>
								<input
									className=" font-barlow bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
									type="email"
									{...emailForm.register('email')}
								/>
								<p className=" font-barlow text-black text-sm">{message}</p>
								{emailForm.formState.errors.email && <p>{emailForm.formState.errors.email.message}</p>}
							</div>
							<div className="mt-8">
								<button className=" font-barlow bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
									Kirim Kode OTP
								</button>
							</div>
						</form> 
					
					)}
					
					
					{state === 'Verify_OTP' && (
					  <form onSubmit={otpForm.handleSubmit(handleOTPValidation)} className='object-center'>
						<p className='font-barlow text-lg'>{`Kode OTP telah dikirim ke ${emailForm.getValues('email')}`}</p>
						<div className="flex flex-row mt-2">

						  {[0,1,2,3,4].map((index) => (
							<Controller
							  key={index}
							  control={otpForm.control}
							  name={`otp.${index}`}

							  render={({ field }) => (
								<input 
								  className="font-barlow bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-1/2 mr-2 text-center appearance-none"
								  maxLength={1}
								  value={field.value || ''}
								  onChange={(e) => {
									field.onChange(e.target.value);
									
									// Auto focus ke input berikutnya
									if (e.target.value && index < 4) {
									  inputRefs.current[index + 1]?.focus();
									}
								  }}
								  onKeyDown={(e) => {
									if (e.key === 'Backspace' && !field.value && index > 0) {
									  inputRefs.current[index - 1]?.focus();
									}
								  }}
								  
								  ref={(el) => {
									  field.ref(el); // wajib! supaya react-hook-form tetap tahu ref nya
									  inputRefs.current[index] = el; // simpan manual buat fokus
								  }}
								/>
							  )}
							/>
						  ))}

						</div>

						{otpForm.formState.errors.otp && <p>{otpForm.formState.errors.otp.message}</p>}
						
						<div className="mt-8">
						  <p className="text-black text-sm">{message}</p>
						  <button className="bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
							Validasi Kode OTP
						  </button>
						</div>
					  </form>
					)}

					
					{state === 'Reset_password' && (
						<form className='object-center'  onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordRequest)}>	
							<div className='flex flex-col align-center'>
								<label className="block text-gray-700 text-sm font-bold mb-2 font-barlow" >Password Baru</label>
								<input
									className="font-barlow bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block mb-2  appearance-none"
									id="new_password"
									type="password"
									{...resetPasswordForm.register('newPassword')}
								/>

								<label className="block text-gray-700 text-sm font-bold mb-2 font-barlow" >Konfirmasi Password Baru</label>
								<input
									className="font-barlow bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block  appearance-none"
									id="confirm_new_password"
									type="password"
									{...resetPasswordForm.register('confirmNewPassword')}
								/>	
							
							<div className="mt-8">
								{resetPasswordForm.formState.errors.newPassword && <p className="text-black text-sm">{resetPasswordForm.formState.errors.newPassword.message}</p>}
								{resetPasswordForm.formState.errors.confirmNewPassword && <p className="text-black text-sm">{resetPasswordForm.formState.errors.confirmNewPassword.message}</p>}
								<button className="bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
									Reset Password
								</button>
							</div>
							
							
							</div>
						</form>
					)}
				
					

					
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
