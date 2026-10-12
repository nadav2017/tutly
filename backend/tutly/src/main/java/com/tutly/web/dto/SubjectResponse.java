package com.tutly.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {

    private Long id;
    private String name;
    private String availableDays;
    private String availableHours;
    private Integer price;
    private Long teacherId;
    private String teacherName;
}