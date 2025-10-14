import { instance } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function getUserApi() {
  return await instance.get("/admin/get-users");
}

async function createUserApi(formData: FormData) {
  return await instance.post("/admin/create-user", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

async function editUserApi({ id, role }: { id: string; role: string }) {
  return await instance.put("/admin/edit-roles", { userId: id, newRole: role });
}

async function deleteUserApi({ id }: { id: string[] }) {
  return await instance.delete("/admin/delete-user", {
    data: { userIds: id }
  });
}

export default function useUser() {

  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["get-users"],
    queryFn: getUserApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: false, // Disable retry to prevent infinite loops
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const {
    mutate: createUser,
    isPending: isCreatingUserPending,
    data: createUserData,
    error: createUserError,
  } = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-users"] })
    }
  });

  const {
    mutate: editUser,
    isPending: isEditingUserPending,
    data: editUserData,
    error: editUserError,
  } = useMutation({
    mutationFn: editUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-users"] })
    }
  });

  const {
    mutate: deleteUser,
    isPending: isDeletingUserPending,
    data: deleteUserData,
    error: deleteUserError,
  } = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-users"] })
    }
  });

  return {
    ...usersQuery,

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
