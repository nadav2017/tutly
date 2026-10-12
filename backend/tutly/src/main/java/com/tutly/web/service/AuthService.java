package com.tutly.web.service;

import com.tutly.web.dto.*;
import com.tutly.web.model.Role;
import com.tutly.web.model.Teacher;
import com.tutly.web.repository.TeacherRepository;
import com.tutly.web.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(TeacherRepository teacherRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        Teacher teacher = new Teacher();
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));
        teacher.setPhone(request.getPhone());
        teacher.setCity(request.getCity());
        teacher.setDescription(request.getDescription());
        teacher.setRole(Role.TEACHER);

        Teacher saved = teacherRepository.save(teacher);

        // 🔥 יצירת token
        String token = jwtService.generateToken(teacher.getEmail(), teacher.getRole().name());

        return new AuthResponse(token,teacher.getEmail(), teacher.getName());
    }

    public AuthResponse login(LoginRequest request) {
        Teacher teacher = teacherRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), teacher.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(
                teacher.getEmail(),
                teacher.getRole().name()
        );

        return new AuthResponse(token, teacher.getEmail(), teacher.getName());
    }
}