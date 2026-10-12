package com.tutly.web.dto;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRequest {
    private String name;
    private String availableDays;
    private String availableHours;
    private Integer price;
}
