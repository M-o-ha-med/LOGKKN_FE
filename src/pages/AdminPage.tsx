import { useState } from 'react';
import Dashboard from '../components/dashboard';
import { FiHome, FiFileText, FiMenu, FiLogOut  } from 'react-icons/fi';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';


function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();	
  
  
	async function Logout(){

		const {data} = await axios.delete(`${import.meta.env.VITE_API_URL}/auth/logout` , { withCredentials: true });
		console.log(data.message);
		if (data.message){
			navigate('/login');
		}
		
		

	}

  return (
    <div className="min-h-screen bg-gray-50 flex ">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-60' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
		
          {/*<img src="/logoapp.svg" alt="logo Anugerah Cipta Arsitektur" className={`w-[4rem] ${isSidebarOpen ?  'block' : 'hidden'}`}/>*/}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="flex flex-col pt-4">
          <NavItem icon={<FiHome />} label="Home" isOpen={isSidebarOpen} hrefTo="/admin/dashboard" isActive={location.pathname === "/admin/dashboard"}/>
          <NavItem icon={<FiFileText />} label="Articles" isOpen={isSidebarOpen} hrefTo="/admin/articles" isActive={location.pathname.startsWith("/admin/articles")}/>
		  
		  <div className= "flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={()=> Logout()}>
			<span className="text-xl ">{<FiLogOut />}</span>
            {isSidebarOpen && <span className="ml-4">Log out</span>}
		  </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'ml-16'} `}>
        <Dashboard />
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  isActive?: boolean;
  hrefTo : string;
}

function NavItem({ icon, label, isOpen, isActive = false , hrefTo }: NavItemProps) {
  return (
    <a
      href={hrefTo}
      className={`
        flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors 
        ${isActive ? 'bg-blue-50 text-blue-600' : ''}
      `}
    >
      <span className="text-xl">{icon}</span>
      {isOpen && <span className="ml-4">{label}</span>}
    </a>
  );
}

export default AdminPage;