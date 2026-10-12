package com.tutly.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    private String name;
    private String phone;
    private Integer rating;
    private String comment;
}