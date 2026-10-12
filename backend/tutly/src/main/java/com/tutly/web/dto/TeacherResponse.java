package com.tutly.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String city;
    private String description;
    private String imageUrl;
}