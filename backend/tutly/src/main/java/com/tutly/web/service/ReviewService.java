package com.tutly.web.service;

import com.tutly.web.dto.ReviewRequest;
import com.tutly.web.dto.ReviewResponse;
import com.tutly.web.model.Review;
import com.tutly.web.model.Teacher;
import com.tutly.web.repository.ReviewRepository;
import com.tutly.web.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TeacherRepository teacherRepository;

    public ReviewService(ReviewRepository reviewRepository, TeacherRepository teacherRepository) {
        this.reviewRepository = reviewRepository;
        this.teacherRepository = teacherRepository;
    }

    // ➕ יצירת חוות דעת
    public ReviewResponse createReview(Long teacherId, ReviewRequest request) {

        if (reviewRepository.existsByTeacherIdAndPhone(teacherId, request.getPhone())) {
            throw new RuntimeException("You already reviewed this teacher");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Review review = new Review();
        review.setName(request.getName());
        review.setPhone(request.getPhone());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setTeacher(teacher);

        Review saved = reviewRepository.save(review);

        return toResponse(saved);
    }

    // 📤 כל החוות דעת של מורה
    public List<ReviewResponse> getReviewsByTeacher(Long teacherId) {

        return reviewRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getName(),
                review.getRating(),
                review.getComment()
        );
    }
}