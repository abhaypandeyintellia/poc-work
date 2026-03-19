import toast from "react-hot-toast";
import { getAuthErrorMessage } from "./authErrorMap";

export default function showAuthErrorToast(error){
    toast.error(getAuthErrorMessage(error));
}