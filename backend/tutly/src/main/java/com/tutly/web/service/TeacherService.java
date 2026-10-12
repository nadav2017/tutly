package com.tutly.web.service;


import com.tutly.web.dto.TeacherRequest;
import com.tutly.web.dto.TeacherResponse;
import com.tutly.web.model.Teacher;
import com.tutly.web.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    // 📤 GET ALL
    public List<TeacherResponse> getTeachers() {
        return teacherRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 📤 GET BY ID
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        return toResponse(teacher);
    }

    // ENTITY → DTO
    private TeacherResponse toResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getPhone(),
                teacher.getCity(),
                teacher.getDescription(),
                teacher.getImageUrl()
        );
    }

    public void deleteByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        teacherRepository.delete(teacher);
    }

    public TeacherResponse updateTeacherByEmail(TeacherRequest request, String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        teacher.setName(request.getName());
        teacher.setPhone(request.getPhone());
        teacher.setCity(request.getCity());
        teacher.setDescription(request.getDescription());

        Teacher updated = teacherRepository.save(teacher);

        return toResponse(updated);
    }

    @Transactional
    public String uploadImage(String email, MultipartFile file) throws IOException {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path uploadPath = Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/" + fileName;

        // 🔥 עדכון entity מנוהל
        teacher.setImageUrl(imageUrl);

        // 🔥 לא חייב save — אבל נשאיר ליתר ביטחון
        teacherRepository.save(teacher);

        System.out.println("Saved image for teacher: " + teacher.getEmail() + " -> " + imageUrl);

        return imageUrl;
    }

    public TeacherResponse getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        return toResponse(teacher);
    }
}