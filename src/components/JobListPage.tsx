"use client";
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import { DatePickerInput } from '@mantine/dates';
import {
  Box, Flex, Text, Button, TextInput, Select, RangeSlider,
  Grid, Card, Avatar, Badge, Stack, Textarea, Modal
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm, Controller } from "react-hook-form";

type Filters = {
  title: string;
  location: string;
  jobType: string;
  salary: [number, number];
};

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  logo?: string;
  posted?: string;
  experiance?: string;
};

export default function JobListPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [filters, setFilters] = useState<Filters>({
    title: "",
    location: "",
    jobType: "",
    salary: [0, 500000],
  });

  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJobs(data);
        else setJobs([]);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      });
  }, []);

  const filtered = Array.isArray(jobs)
    ? jobs.filter((j) => {
        if (filters.title && !j.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
        if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.jobType && filters.jobType !== "" && j.jobType !== filters.jobType) return false;
        const [smin, smax] = filters.salary;
        if (smin > 0 && j.salaryMax && j.salaryMax < smin) return false;
        if (smax < 500000 && j.salaryMin && j.salaryMin > smax) return false;
        return true;
      })
    : [];

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      title: "",
      company: "",
      location: "",
      jobType: "",
      salaryMin: "",
      salaryMax: "",
      description: "",
      applicationDeadline: null,
    },
  });

  const onSubmit = (data: any) => {
    const next: Job = {
      id: jobs.length + 1,
      title: data.title,
      company: data.company,
      location: data.location,
      jobType: data.jobType,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
      description: data.description,
      logo: undefined,
      posted: "Just now",
    };
    setJobs((p) => [next, ...p]);
    reset();
    close();
  };

  const onSalaryChange = (v: [number, number]) => setFilters((s) => ({ ...s, salary: v }));

  return (
    <Box>
      {/* Navbar */}
      <Flex justify="center" align="center" gap="xl" style={{ marginBottom: 24, marginTop: 24 }}>
        <Image src="/logo.png" alt="Logo" width={30} height={30} style={{ borderRadius: 4 }} />
        {["Home", "Find Job", "Find Talent", "About Us", "Testimonials"].map((link) => (
          <Text key={link} style={{ cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
            {link}
          </Text>
        ))}
        <Button onClick={open} style={{ marginLeft: "16px" }}>Create Job</Button>
      </Flex>

      {/* Filters */}
      <Flex justify="center" align="center" style={{ padding: "16px 24px", gap: 16, marginBottom: 24 }}>
        <TextInput placeholder="Search by title" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.currentTarget.value })} style={{ width: 280 }} />
        <TextInput placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.currentTarget.value })} style={{ width: 200 }} />
        <Select placeholder="Job Type" data={["", "Full-time", "Part-time", "Contract", "Internship"]} value={filters.jobType} onChange={(v) => setFilters({ ...filters, jobType: v || "" })} style={{ width: 180 }} />
        <Box style={{ width: 260 }}>
          <RangeSlider min={0} max={500000} step={5000} value={filters.salary} onChange={(v) => onSalaryChange(v as [number, number])} />
        </Box>
      </Flex>

      {/* Job Grid */}
      <Grid>
        {filtered.map((job) => (
          <Grid.Col key={job.id} span={3}>
            <Card withBorder shadow="sm" p="lg" style={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Flex justify="space-between" align="center">
                <Avatar src={job.logo} radius="sm" size={55} />
                <Badge>{job.posted}</Badge>
              </Flex>
              <Text fw={700} size="2xl" mt={8}>{job.title}</Text>
              <Flex gap="sm" mt={4}>
                <Badge color="gray" variant="outline">{job.experiance || "1-2 yrs"}</Badge>
                <Badge color="blue" variant="outline">{job.jobType || "Onsite"}</Badge>
                <Badge color="green" variant="outline">{job.salaryMax ? `${job.salaryMax / 100000} LPA` : "12 LPA"}</Badge>
              </Flex>
              <Text size="sm" color="dimmed" mt={8} lineClamp={3}>{job.description}</Text>
              <Button fullWidth radius="md" mt={12}>Apply Now</Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Create Job Modal */}
      <Modal opened={opened} onClose={close} title="Create Job" centered size={700}>
        <Box style={{ padding: "24px 16px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid gutter="md">
              <Grid.Col span={6}><TextInput label="Job Title" placeholder="Enter job title" {...register("title", { required: true })} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Company Name" placeholder="Enter company name" {...register("company")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Location" placeholder="Enter location" {...register("location")} /></Grid.Col>
              <Grid.Col span={6}>
                <Controller name="jobType" control={control} render={({ field }) => (
                  <Select label="Job Type" placeholder="Select type" data={["Full-time", "Part-time", "Contract", "Internship"]} {...field} />
                )} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Flex gap="sm">
                  <TextInput label="Salary Min" placeholder="e.g. 500000" {...register("salaryMin")} />
                  <TextInput label="Salary Max" placeholder="e.g. 900000" {...register("salaryMax")} />
                </Flex>
              </Grid.Col>
              <Grid.Col span={6}>
                <Controller name="applicationDeadline" control={control} render={({ field }) => (
                  <DatePickerInput {...field} placeholder="Pick a date" label="Application Deadline" clearable />
                )} />
              </Grid.Col>
              <Grid.Col span={12}><Textarea label="Job Description" placeholder="Enter description" {...register("description")} minRows={5} /></Grid.Col>
              <Grid.Col span={12}>
                <Flex justify="flex-end" gap="sm" style={{ marginTop: 16 }}>
                  <Button variant="outline" type="button" onClick={() => { reset(); close(); }}>Save Draft</Button>
                  <Button type="submit">Publish</Button>
                </Flex>
              </Grid.Col>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}
