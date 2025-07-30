import { FiEdit, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import type { Logs } from '../types/type';
import DeleteAlert from '../components/alerts.tsx';

export default function ArticlesTable() {
  // State management
  const [articles, setArticles] = useState<Logs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [showAlert, setShowAlert] = useState(false);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  const handleOpenAlert = (slug: string) => {
	  setSlugToDelete(slug);
	  setShowAlert(true);
  };

  const handleConfirmDelete = async (slug: string) => {
	  await deleteArticle(slug);
	  setShowAlert(false);
  };
  
  async function fetchArticles() {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles`);
	  console.log(response);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  
  async function deleteArticle(slug: string) {
    try {
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/articles/delete/${slug}`);
      fetchArticles();
    } 
	
	
	catch (err) {
      console.error("Failed to delete article:", err);
      setError("Failed to delete article. Please try again later.");
	  throw err;
      
    }
  }
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
    </div>
  );
  
  // Pagination component
  const Pagination = () => (
    <div className="flex justify-between items-center mt-6 font-barlow">
      <div className="text-sm text-gray-600">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, articles.length)} of {articles.length} entries
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1} 
          className={`p-2 rounded-md mx-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'}`}
        >
          <FiChevronLeft />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`w-8 h-8 mx-1 rounded-md ${
              currentPage === number 
                ? 'bg-blue-700 text-white' 
                : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            {number}
          </button>
        ))}
        
        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages || totalPages === 0} 
          className={`p-2 rounded-md mx-1 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'}`}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="border border-gray-200 rounded-sm p-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <table className="font-barlow text-xl table-auto border-b-2 border-gray-200 w-full">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="border-r-2 border-gray-200 p-3 text-left">no</th>
                <th className="border-r-2 border-gray-200 p-3 text-left">Judul</th>
                <th className="border-r-2 border-gray-200 p-3 text-center">Gambar</th>	
                <th className="p-3 text-center">Aksi</th>								
              </tr>
            </thead>
            
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Tidak ada artikel yang ditulis
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{indexOfFirstItem + index + 1}</td>
                    <td className="p-3">{item.title}</td>
                    <td className="p-3 text-center">
                      <img src={item.image_url[0]} className="w-24 h-auto mx-auto rounded-md object-cover" alt={item.title} />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                        <Link 
                          to={`/admin/Articles/update/${item.slug}`} 
                          className="flex items-center justify-center px-3 rounded-md bg-blue-700 text-white p-2 w-24 hover:bg-blue-800 transition-colors"
                        >
                          <span className="text-xl"><FiEdit /></span>
                          <span className="ml-2 text-sm">Edit</span>
                        </Link>	
                        <button 
                          className="flex items-center justify-center px-3 rounded-md bg-red-700 text-white p-2 w-24 hover:bg-red-800 transition-colors" 
                          onClick={() => handleOpenAlert(item.slug)}
                        >
                          <span className="text-xl"><RiDeleteBin6Line /></span>
                          <span className="ml-2 text-sm">Delete</span>
                        </button>									
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
		  
          {showAlert && slugToDelete && (
			  <DeleteAlert
				slug={slugToDelete}
				onConfirm={handleConfirmDelete}
				message={"Apakah anda yakin ingin menghapus artikel ini ?"}
				onCancel={() => setShowAlert(false)}
				objType={"Artikel"}
			  />
			)}

          {articles.length > 0 && <Pagination />}
        </>
      )}
    </div>
  );
}