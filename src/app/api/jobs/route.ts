import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM job ORDER BY id DESC");
    const jobs = result.rows;

    // Map salary and experience if needed
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobtype: job.jobtype,
      salarymin: job.salarymin,
      salarymax: job.salarymax,
      description: job.description,
      logo: job.logo,
      posted: job.posted,
      experiance: job.experiance,
    }));

    return NextResponse.json(formattedJobs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
