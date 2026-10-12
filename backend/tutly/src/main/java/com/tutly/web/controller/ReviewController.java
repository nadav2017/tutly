package com.tutly.web.controller;

import com.tutly.web.dto.ReviewRequest;
import com.tutly.web.dto.ReviewResponse;
import com.tutly.web.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ➕ יצירת חוות דעת
    @PostMapping("/teacher/{teacherId}")
    public ReviewResponse createReview(@PathVariable Long teacherId,
                                       @RequestBody ReviewRequest request) {
        return reviewService.createReview(teacherId, request);
    }

    // 📤 קבלת חוות דעת
    @GetMapping("/teacher/{teacherId}")
    public List<ReviewResponse> getReviews(@PathVariable Long teacherId) {
        return reviewService.getReviewsByTeacher(teacherId);
    }
}