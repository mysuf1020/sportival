<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function createUser(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['role'] = $data['role'] ?? 'user';

        return $this->userRepository->create($data);
    }

    public function getUserById(int $id): User
    {
        return $this->userRepository->findById($id);
    }

    public function getAllUsers(int $page = 1, int $perPage = 10): array
    {
        $paginator = $this->userRepository->findAll($page, $perPage);

        return [
            'users' => $paginator->items(),
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total_rows' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
            ],
        ];
    }

    public function updateUser(int $id, array $data): User
    {
        return $this->userRepository->update($id, $data);
    }

    public function deleteUser(int $id): void
    {
        $this->userRepository->delete($id);
    }
}
