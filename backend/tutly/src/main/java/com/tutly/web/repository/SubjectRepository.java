package com.tutly.web.repository;

import com.tutly.web.model.Subject;
import org.springframework.boot.data.autoconfigure.web.DataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher")
    List<Subject> findAllWithTeacher();

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher WHERE s.teacher.email = :email")
    List<Subject> findByTeacherEmailWithTeacher(String email);

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher WHERE s.id = :id")
    Optional<Subject> findByIdWithTeacher(Long id);

    @Query("""
            SELECT s FROM Subject s 
            JOIN FETCH s.teacher t 
            WHERE t.id = :teacherId
            """)
    List<Subject> findByTeacherIdWithTeacher(Long teacherId);

    @Query("""
            SELECT s FROM Subject s
            JOIN FETCH s.teacher t
            WHERE (:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:city IS NULL OR LOWER(t.city) LIKE LOWER(CONCAT('%', :city, '%')))
            AND (:maxPrice IS NULL OR s.price <= :maxPrice)
            """)
    List<Subject> searchSubjects(String name, String city, Integer maxPrice);
}

