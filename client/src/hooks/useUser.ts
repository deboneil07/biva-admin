import { instance } from "@/utils/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

async function getUserApi() {
  return await instance.get("/admin/get-users");
}

async function createUserApi({ name, email, password, role }: { name: string; email: string; password: string; role: string }) {
  return await instance.post("/admin/create-user", { name, email, password, role });
}

async function editUserApi({ id, role }: { id: string; role: string }) {
  return await instance.post("/admin/edit-roles", { userId: id, newRole: role });
}

async function deleteUserApi({ id }: { id: string }) {
  return await instance.post("/admin/delete-user", { id });
}

export default function useUser() {
  const {
    refetch: getUsers,
    isFetching: isGettingUsersPending,
    data: getUsersData,
    error: getUsersError,
  } = useQuery({
    queryKey: ["get-users"],
    queryFn: getUserApi,
    enabled: false,
  });

  const {
    mutate: createUser,
    isPending: isCreatingUserPending,
    data: createUserData,
    error: createUserError,
  } = useMutation({
    mutationFn: createUserApi,
  });

  const {
    mutate: editUser,
    isPending: isEditingUserPending,
    data: editUserData,
    error: editUserError,
  } = useMutation({
    mutationFn: editUserApi,
  });

  const {
    mutate: deleteUser,
    isPending: isDeletingUserPending,
    data: deleteUserData,
    error: deleteUserError,
  } = useMutation({
    mutationFn: deleteUserApi,
  });

  return {
    getUsers,
    isGettingUsersPending,
    getUsersData,
    getUsersError,

    createUser,
    isCreatingUserPending,
    createUserData,
    createUserError,

    editUser,
    isEditingUserPending,
    editUserData,
    editUserError,

    deleteUser,
    isDeletingUserPending,
    deleteUserData,
    deleteUserError,
  };
}
