import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Logs } from '../types/type';
import axios from "axios";

export default function ArticlePage() {
  const [article, setArticle] = useState<Logs | null>(null);
  const { slug } = useParams();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/articles/${slug}`
        );
        setArticle(response.data[0]); // assuming the API returns [ { title, content, images: [...] } ]
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    }

    fetchArticle();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full border-solid border-black shadow-md">
        <h5 className="text-blue-500 text-2xl font-bold px-4 py-4">
          LogBook KKN 309
        </h5>
      </div>

      {article ? (
        <>
          <div className="max-w-4xl w-full p-4">
            <h1 className="text-4xl font-bold mb-4 font-barlow">
              {article.title}
            </h1>
            <div className="prose lg:prose-lg max-w-none font-barlow">
              {article.content}
            </div>
          </div>

          <p className="text-2xl font-bold mb-4 font-barlow">Dokumentasi</p>

          <div className="max-w-4xl w-full p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {article?.image_url.map((item, index) => (
              <div key={index} className="mb-4">
                <img
                  src={item}
                  alt={`image-${index}`}
                  className="w-full h-auto rounded shadow"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">Memuat artikel...</p>
      )}
    </div>
  );
}
