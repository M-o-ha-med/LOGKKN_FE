import React, { useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Toast from '../components/toast.tsx';



const LoginPage: React.FC = () => {

	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error , setError] = useState('');



	const handleSubmit = async (e:any) => {
		e.preventDefault();
		const result = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password } , { withCredentials: true });
		try{
		
		console.log(result);
		if(result.data.message === 'Login successful'){
			const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check`, { withCredentials: true });
			if (data.user.state === true) {navigate('/admin/dashboard');}
			
			else {Toast.fire({title : `Login Gagal ${data.state}` , icon : "error"})}
			
		}
		
		}
		
		catch(err:any){
			const errorMessage = err.data?.message || "Unexpected error occurred";
			Toast.fire({title : errorMessage , icon : "error"});
			console.log(err);
			setError(errorMessage);
		}

	};
	


	return (
		<div className="py-[10rem]">
			<div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm h-[35rem] lg:max-w-xl">
				<div className="w-full p-8 mx-auto my-auto lg:w-full">
					<form onSubmit={handleSubmit}>
						<p className="text-gray-700 text-4xl font-bold mb-2 text-center">Login</p>
						<div className="mt-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
							<input
								className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
								type="email"
								id="email"
								onChange={(e) => setEmail(e.target.value)}
							/>
							<p className="text-red-400 text-sm">{error}</p>
						</div>
						<div className="mt-4">
							<div className="flex justify-between">
								<label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
								<a href="/admin/login/forget" className="text-xs text-gray-500">
									Forget Password?
								</a>
							</div>
							<input
								className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
								type="password"
								id="password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="mt-12">
							<button className="bg-blue-400 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
								Login
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
