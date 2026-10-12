package com.tutly.web.repository;

import com.tutly.web.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTeacherId(Long teacherId);

    boolean existsByTeacherIdAndPhone(Long teacherId, String phone);
}