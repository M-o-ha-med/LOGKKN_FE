import { Navigate, Outlet } from "react-router-dom";
import { useEffect , useState} from "react";
import { atom , useRecoilState  } from "recoil";

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
			
				console.log("Auth API Response:", state_val);
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