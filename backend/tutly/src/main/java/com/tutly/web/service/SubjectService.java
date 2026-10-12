package com.tutly.web.service;

import com.tutly.web.dto.SubjectRequest;
import com.tutly.web.dto.SubjectResponse;
import com.tutly.web.model.Subject;
import com.tutly.web.model.Teacher;
import com.tutly.web.repository.SubjectRepository;
import com.tutly.web.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public SubjectService(SubjectRepository subjectRepository,
                          TeacherRepository teacherRepository) {
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
    }
    // 📤 GET ALL
    public List<SubjectResponse> getSubjects() {
        return subjectRepository.findAllWithTeacher()
                .stream()
                .map(this::toResponse)
                .toList();

    }
    // 📤 GET BY ID
    public SubjectResponse getSubjectById(Long id) {

        Subject subject = subjectRepository.findByIdWithTeacher(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        return toResponse(subject);
    }

    public SubjectResponse createSubject(SubjectRequest request, String teacherEmail) {

        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setAvailableDays(request.getAvailableDays());
        subject.setAvailableHours(request.getAvailableHours());
        subject.setPrice(request.getPrice());
        subject.setTeacher(teacher);


        Subject saved = subjectRepository.save(subject);

        return new SubjectResponse(
                saved.getId(),
                saved.getName(),
                saved.getAvailableDays(),
                saved.getAvailableHours(),
                saved.getPrice(),
                teacher.getId(),
                teacher.getName()
        );
    }

    // 🔄 ENTITY → DTO
    private SubjectResponse toResponse(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getAvailableDays(),
                subject.getAvailableHours(),
                subject.getPrice(),
                subject.getTeacher().getId(),
                subject.getTeacher().getName()
        );
    }


    public List<SubjectResponse> getSubjectsByTeacher(String email) {
        return subjectRepository.findByTeacherEmailWithTeacher(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SubjectResponse updateSubject(Long id, SubjectRequest request, String email) {

        Subject subject = subjectRepository.findByIdWithTeacher(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // 🔐 בדיקה שהמקצוע שייך למורה
        if (!subject.getTeacher().getEmail().equals(email)) {
            throw new RuntimeException("Not allowed");
        }

        subject.setName(request.getName());
        subject.setAvailableDays(request.getAvailableDays());
        subject.setAvailableHours(request.getAvailableHours());
        subject.setPrice(request.getPrice());

        subjectRepository.save(subject);

        return toResponse(subject);
    }
    public void deleteSubject(Long id, String email) {

        Subject subject = subjectRepository.findByIdWithTeacher(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // 🔐 בדיקה שהמקצוע שייך למורה
        if (!subject.getTeacher().getEmail().equals(email)) {
            throw new RuntimeException("Not allowed");
        }

        subjectRepository.delete(subject);
    }
    public List<SubjectResponse> getSubjectsByTeacherId(Long teacherId) {

        return subjectRepository.findByTeacherIdWithTeacher(teacherId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public List<SubjectResponse> searchSubjects(String name, String city, Integer maxPrice) {

        return subjectRepository.searchSubjects(name, city, maxPrice)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}