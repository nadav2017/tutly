package com.tutly.web.controller;

import com.tutly.web.dto.TeacherRequest;
import com.tutly.web.dto.TeacherResponse;
import com.tutly.web.model.Teacher;
import com.tutly.web.service.TeacherService;
import io.jsonwebtoken.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    // 📤 GET
    @GetMapping
    public List<TeacherResponse> getTeachers() {
        return teacherService.getTeachers();
    }
    // 📤 GET BY ID
    @GetMapping("/{id}")
    public TeacherResponse getTeacherById(@PathVariable Long id) {
        return teacherService.getTeacherById(id);
    }
    @GetMapping("/me")
    public TeacherResponse getMyProfile(Authentication authentication) {

        Teacher principal = (Teacher) authentication.getPrincipal();

        return teacherService.getTeacherByEmail(principal.getEmail());
    }

    // DELETE
    @DeleteMapping("/me")
    public void deleteMyAccount(Authentication authentication) {
        Teacher teacher = (Teacher) authentication.getPrincipal();
        teacherService.deleteByEmail(teacher.getEmail());
    }

    // 🔄 UPDATE
    @PutMapping("/me")
    public TeacherResponse updateMyProfile(@RequestBody TeacherRequest request,
                                           Authentication authentication) {

        Teacher teacher = (Teacher) authentication.getPrincipal();

        return teacherService.updateTeacherByEmail(request, teacher.getEmail());
    }
    @PostMapping("/upload-image")
    public String uploadImage(@RequestParam("file") MultipartFile file,
                              Authentication authentication) throws IOException, java.io.IOException {

        Teacher principal = (Teacher) authentication.getPrincipal();

        return teacherService.uploadImage(principal.getEmail(), file);
    }



}