package com.tutly.web.controller;

import com.tutly.web.dto.SubjectRequest;
import com.tutly.web.dto.SubjectResponse;
import com.tutly.web.model.Teacher;
import com.tutly.web.service.SubjectService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }
    // GET
    @GetMapping
    public List<SubjectResponse> getSubjects() {
        return subjectService.getSubjects();
    }
    @GetMapping("/{id}")
    public SubjectResponse getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id);
    }
    @GetMapping("/teacher/{teacherId}")
    public List<SubjectResponse> getSubjectsByTeacher(@PathVariable Long teacherId) {
        return subjectService.getSubjectsByTeacherId(teacherId);
    }
    @GetMapping("/search")
    public List<SubjectResponse> searchSubjects(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer maxPrice
    ) {
        return subjectService.searchSubjects(name, city, maxPrice);
    }
    @PostMapping
    public SubjectResponse createSubject(@RequestBody SubjectRequest request,
                                         Authentication authentication) {
        Teacher teacher = (Teacher) authentication.getPrincipal();
        return subjectService.createSubject(request, teacher.getEmail());
    }
    @GetMapping("/me")
    public List<SubjectResponse> getMySubjects(Authentication authentication) {
        Teacher teacher = (Teacher) authentication.getPrincipal();

        return subjectService.getSubjectsByTeacher(teacher.getEmail());
    }
    // UPDATE
    @PutMapping("/{id}")
    public SubjectResponse updateSubject(@PathVariable Long id,
                                         @RequestBody SubjectRequest request,
                                         Authentication authentication) {

        Teacher teacher = (Teacher) authentication.getPrincipal();
        return subjectService.updateSubject(id, request, teacher.getEmail());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id,
                              Authentication authentication) {

        Teacher teacher = (Teacher) authentication.getPrincipal();
        subjectService.deleteSubject(id, teacher.getEmail());
    }




}