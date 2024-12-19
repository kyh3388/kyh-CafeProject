package com.demo.users;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service // 이 클래스가 서비스 컴포넌트임을 나타냄
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 모든 사용자 조회
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    // 사용자 저장
    @Transactional // 트랜잭션 관리를 통해 데이터 일관성 보장
    public UserEntity saveUser(UserEntity user) {
        try {
            return userRepository.save(user); // 사용자 저장
        } catch (Exception e) {
            System.out.println("사용자 저장 오류: " + e.getMessage());
            throw new RuntimeException("사용자 저장 중 오류 발생", e);
        }
    }

    // 사용자 ID로 사용자 정보 가져오기
    public UserEntity getUserById(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    // 사용자 인증 메서드
    public UserEntity authenticate(String userId, String userPassword) {
        UserEntity user = getUserById(userId);
        if (user != null && user.getUserPassword().equals(userPassword)) {
            return user; // 아이디와 비밀번호가 일치하는 경우 사용자 반환
        }
        return null;  
    }

    // 사용자 프로필 업데이트
    public void updateUserProfile(String id, String nickname, String name, String password, Integer userLevel, MultipartFile profileImage) {
        Optional<UserEntity> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            user.setUserNickname(nickname); // 닉네임 설정
            user.setUserName(name); // 이름 설정
            user.setUserPassword(password); // 비밀번호 설정
            user.setUserLevel(userLevel); // 레벨 설정

            // 프로필 이미지가 있는 경우 설정
            if (profileImage != null && !profileImage.isEmpty()) {
                try {
                    user.setUserImage(profileImage.getBytes());
                } catch (IOException e) {
                    throw new RuntimeException("프로필 이미지 처리 중 오류 발생", e);
                }
            }

            userRepository.save(user); // 업데이트된 사용자 저장
        } else {
            throw new RuntimeException("User not found with id " + id);
        }
    }

    // 비밀번호 업데이트 메서드
    public void updatePassword(String id, String newPassword) {
        Optional<UserEntity> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            user.setUserPassword(newPassword); // 새 비밀번호 설정
            userRepository.save(user); // 변경 사항 저장
        } else {
            throw new RuntimeException("User not found with id " + id);
        }
    }

    // 닉네임으로 사용자 아이디 찾기
    public String findUserIdByNickname(String nickname) {
        UserEntity user = userRepository.findByUserNickname(nickname);
        return user != null ? user.getUserId() : null; // 닉네임이 일치하는 사용자의 아이디 반환
    }

    // 닉네임과 아이디로 비밀번호 찾기
    public String findUserPasswordByNicknameAndId(String nickname, String userId) {
        UserEntity user = userRepository.findByUserNicknameAndUserId(nickname, userId);
        return user != null ? user.getUserPassword() : null; // 닉네임과 아이디가 일치하는 사용자의 비밀번호 반환
    }
    
    // 사용자 삭제
    public void deleteUser(String userId) {
        userRepository.deleteById(userId); // 사용자 ID로 사용자 삭제
    }

    // 사용자 정보 업데이트 (관리자 전용)
    @Transactional
    public UserEntity updateUser(String id, UserEntity userDetails) {
        Optional<UserEntity> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            user.setUserNickname(userDetails.getUserNickname()); // 닉네임 설정
            user.setUserName(userDetails.getUserName()); // 이름 설정
            user.setUserLevel(userDetails.getUserLevel()); // 레벨 설정
            user.setUserPassword(userDetails.getUserPassword()); // 비밀번호 설정
            return userRepository.save(user); // 업데이트된 사용자 저장
        } else {
            throw new RuntimeException("User not found with id " + id);
        }
    }

    // 아이디 또는 닉네임 중복 확인
    public boolean isUserIdOrNicknameExists(String userId, String userNickname) {
        boolean userIdExists = false;
        boolean nicknameExists = false;

        // 아이디 중복 여부 확인
        if (userId != null && !userId.isEmpty()) {
            userIdExists = userRepository.findById(userId).isPresent();
        }

        // 닉네임 중복 여부 확인
        if (userNickname != null && !userNickname.isEmpty()) {
            nicknameExists = userRepository.findByUserNickname(userNickname) != null;
        }

        return userIdExists || nicknameExists; // 중복 여부 반환
    }
}
