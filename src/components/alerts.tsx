import Swal from 'sweetalert2';
import { useEffect } from 'react';

type DeleteAlertProps = {
  slug: string;
  message : string;
  onConfirm: (slug: string) => void;
  onCancel: () => void;
  objType : string;
  
};

const DeleteAlert = ({ slug, message,onConfirm, onCancel,objType }: DeleteAlertProps) => {
  useEffect(() => {
    Swal.fire({
      title: message,
      showDenyButton: true,
      confirmButtonText: "Iya",
      denyButtonText: "Tidak",
	  icon : "question"
    }).then(async(result) => {
      if (result.isConfirmed) {
		try{
			await onConfirm(slug);
			Swal.fire("Berhasil!", `${objType} Berhasil dihapus`, "success");
		}

		catch(err){Swal.fire("Gagal!", `Terjadi kesalahan saat menghapus ${objType}`, "error");}
        
      } else {
        onCancel();
      }
    });
  }, [slug]);

  return null; // This component doesn't render anything visible
};

export default DeleteAlert;
