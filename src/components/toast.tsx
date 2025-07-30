import Swal from 'sweetalert2'
import '../styles/toast.css'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
})

export default  Toast;