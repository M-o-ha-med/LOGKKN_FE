import { Navigate, Outlet } from "react-router-dom";
import { useEffect , useState} from "react";
import { atom , useRecoilState  } from "recoil";
import axios from 'axios';

export const authState = atom<boolean>({
	key : "AuthState",
	default : false
	
});


export const PrivateRoute: React.FC =  () => {
	const [state_val, setAuthState] = useRecoilState (authState);

	const [loading, setLoading] = useState(true); 
	
	useEffect(() => {
		const authenticateUser = async () => {
		
			try {
				const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check` , {withCredentials: true});
				setAuthState(data.user.state);
			}
			catch(e){setAuthState(false)}
			finally{setLoading(false)}



			
		}
		
		authenticateUser();
	
	}, [setAuthState]);
	
	if (loading) {
		return <p>Checking authentication...</p>;
	}

	
	return state_val ? <Outlet /> : <Navigate to="/login" replace />;
	
	

};

export default PrivateRoute;