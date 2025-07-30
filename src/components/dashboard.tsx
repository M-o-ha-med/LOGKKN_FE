import ArticleForm from '../components/articleForm.tsx';
import ArticlesTable from '../components/articleTables.tsx';
import { useLocation , useParams } from 'react-router-dom';



export default function Dashboard() {
  const location = useLocation();
  const { slug } = useParams();


	
 
  

  return (

    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">


          <div className="font-barlow mt-6"> 
            {(location.pathname === '/admin/articles') ? (
              <div className="space-y-8">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Articles</h2>
				  <a href='/admin/articles/new' >
					<button className='bg-blue-700 text-white p-2 rounded-md mb-6 hover:bg-blue-800 text-md font-medium'>
						+ New Article
					</button>
				  </a>
				  <ArticlesTable />

                </div>
              </div>
			  
            ) : ( location.pathname === '/admin/articles/new' || location.pathname === `/admin/Articles/update/${slug}`) ? (
                <div className="bg-white shadow rounded-lg p-6">
					<ArticleForm />
				</div>
			
			) : (
			
              <div className="space-y-8">
				<div className='grid grid-cols-2 gap-6'>

					<div className='bg-white p-4 rounded-md shadow-sm'>
						<h2 className=' text-2xl mb-4 font-bold'>Halo !</h2>
						<h3 className=' text-xl mb-2 font-medium'>USERNAME</h3>
					</div>	
					
					
				</div> 
              </div>
			)}
          </div>
        </div>
      </div>
    </div>
  );
}