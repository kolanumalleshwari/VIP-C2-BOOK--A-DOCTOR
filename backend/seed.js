import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Payment from './models/Payment.js';
import Prescription from './models/Prescription.js';
import Review from './models/Review.js';
import AvailabilitySlot from './models/AvailabilitySlot.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medconnect';

const specialties = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'Gynecology',
  'Gastroenterology',
];

const qualifications = ['MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'BAMS, MS', 'MD, FACC'];
const hospitals = [
  'City General Hospital',
  'Metro Care Clinic',
  'Apollo Health Hub',
  'Max Wellness Center',
  'Fortis Medicity',
];
const addresses = [
  '102 Park Avenue, Sector 4',
  '45 Ring Road, Mall Area',
  '12 Baker Street, Downtown',
  '89 Green Hills Lane',
  '55 North Boulevard',
];

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const firstNames = [
  'John', 'Jane', 'Robert', 'Emily', 'William', 'Linda', 'David', 'Susan', 'James', 'Patricia',
  'Charles', 'Elizabeth', 'Joseph', 'Sarah', 'Thomas', 'Jessica', 'Christopher', 'Karen', 'Daniel', 'Nancy',
  'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Paul', 'Dorothy', 'Andrew', 'Kimberly', 'Joshua', 'Emily', 'Kenneth', 'Donna', 'Kevin', 'Michelle',
  'Brian', 'Carol', 'George', 'Amanda', 'Edward', 'Melissa', 'Ronald', 'Deborah', 'Timothy', 'Stephanie',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
  'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall',
  'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres',
];

const medicinesList = [
  { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '3 days' },
  { name: 'Amoxicillin', dosage: '250mg', frequency: 'Twice daily', duration: '5 days' },
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'Once daily (after meals)', duration: '5 days' },
  { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily (at night)', duration: '7 days' },
  { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily (before breakfast)', duration: '10 days' },
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily (with meals)', duration: '30 days' },
  { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily (at night)', duration: '30 days' },
  { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
];

const reviewsTexts = [
  'Excellent doctor! Very polite, listened to all problems carefully, and explained the diagnosis perfectly.',
  'Great experience, highly recommend. Very professional and the clinic was extremely neat and tidy.',
  'Average consultation, doctor was in a hurry but the prescription was accurate.',
  'Amazing treatment. I am feeling much better now. Dr. is very experienced.',
  'Wait time was a bit long, but the consultation was highly satisfactory and details were explained well.',
  'Very professional and friendly staff. Doctor has excellent clinical knowledge.',
];

const runSeeder = async () => {
  try {
    console.log(`Connecting to MongoDB for seeding at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully. Cleaning existing database...');

    // Clear collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Prescription.deleteMany({});
    await Review.deleteMany({});
    await AvailabilitySlot.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Database cleaned. Seeding Super Admins & Admins...');

    // Hash password helper
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Admin@123', salt);

    // 1. Super Admin
    const superAdminUser = await User.create({
      name: 'Super Admin Practitioner',
      email: 'superadmin@mediconnect.com',
      password: 'Admin@123', // hooks will auto hash
      phone: '9876543210',
      gender: 'Male',
      role: 'Super Admin',
      isVerified: true,
    });

    // 2. Admin
    const adminUser = await User.create({
      name: 'Platform Operations Admin',
      email: 'admin@mediconnect.com',
      password: 'Admin@123',
      phone: '9876543211',
      gender: 'Female',
      role: 'Admin',
      isVerified: true,
    });

    console.log('Admin accounts registered. Seeding 50+ Doctors...');

    // 3. 52 Doctors
    const doctorsList = [];
    for (let i = 1; i <= 52; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const specialization = specialties[i % specialties.length];

      const docUser = await User.create({
        name: `Dr. ${firstName} ${lastName}`,
        email: `doctor${i}@mediconnect.com`,
        password: 'Admin@123',
        phone: `90000000${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        role: 'Doctor',
        isVerified: true,
      });

      const doctor = await Doctor.create({
        userId: docUser._id,
        specialization,
        qualification: qualifications[i % qualifications.length],
        experience: 5 + (i % 25),
        consultationFee: 300 + (i % 15) * 50,
        hospitalName: hospitals[i % hospitals.length],
        clinicAddress: addresses[i % addresses.length],
        bio: `Experienced specialist in ${specialization} with a demonstrated history of clinical excellence.`,
        about: `Dr. ${firstName} ${lastName} has spent over ${5 + (i % 25)} years serving diverse patient groups. Specializing in advanced diagnostics, telemedicine, and preventive healthcare strategies. Dedicated to customized patient-centered care.`,
        languages: ['English', i % 3 === 0 ? 'Hindi' : 'Spanish'],
        certifications: [`Board Certified in ${specialization}`, `Fellowship in Advanced Medicine`],
        consultationMethods: ['Video', 'Audio', 'Chat'].slice(0, 1 + (i % 3)),
        approved: i <= 45, // First 45 are pre-approved, remaining 7 are pending onboarding
        rating: 4.0 + (i % 11) * 0.1,
        totalReviews: 0,
      });

      doctorsList.push(doctor);
    }
    console.log(`Seeded ${doctorsList.length} Doctor profiles.`);

    console.log('Seeding 102 Patients...');

    // 4. 102 Patients
    const patientsList = [];
    for (let i = 1; i <= 102; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      const patUser = await User.create({
        name: `${firstName} ${lastName}`,
        email: `patient${i}@mediconnect.com`,
        password: 'Admin@123',
        phone: `80000000${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        role: 'Patient',
        isVerified: true,
      });

      const patient = await Patient.create({
        userId: patUser._id,
        age: 18 + (i % 65),
        bloodGroup: bloodGroups[i % bloodGroups.length],
        emergencyContact: `9999999${i.toString().padStart(3, '0')}`,
        address: addresses[i % addresses.length],
      });

      patientsList.push(patient);
    }
    console.log(`Seeded ${patientsList.length} Patient profiles.`);

    console.log('Seeding appointments, payments, reviews & prescriptions (past 6 months)...');

    // 5. Historical booking loop (approx 200 appointments)
    let appointmentCount = 0;
    const now = new Date();
    const approvedDoctors = doctorsList.filter((d) => d.approved);

    for (let i = 0; i < 220; i++) {
      const patient = patientsList[i % patientsList.length];
      const doctor = approvedDoctors[Math.floor(Math.random() * approvedDoctors.length)];

      // Construct a past date
      const appointmentDate = new Date();
      appointmentDate.setDate(now.getDate() - (i % 180)); // spread over 180 days (6 months)
      appointmentDate.setHours(0, 0, 0, 0);

      const timeSlot = `${10 + (i % 8)}:00`;
      const statusOptions = ['Completed', 'Confirmed', 'Cancelled', 'Pending'];
      // Weigh towards Completed (70%), Confirmed (15%), Cancelled (10%), Pending (5%)
      let status = 'Completed';
      if (i % 10 === 7 || i % 10 === 8) status = 'Confirmed';
      else if (i % 10 === 9) status = 'Cancelled';
      else if (i % 10 === 0) status = 'Pending';

      try {
        const appointment = await Appointment.create({
          patientId: patient._id,
          doctorId: doctor._id,
          appointmentDate,
          appointmentTime: timeSlot,
          reason: `Routine follow-up for health issues.`,
          status,
          telemedicineUrl: status === 'Completed' || status === 'Confirmed' 
            ? `https://meet.jit.si/mediconnect-pro-${crypto.randomBytes(4).toString('hex')}` 
            : '',
        });

        appointmentCount++;

        // If Completed or Confirmed, seed Payment
        if (status === 'Completed' || status === 'Confirmed') {
          const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
          const payment = await Payment.create({
            transactionId,
            userId: patient.userId,
            appointmentId: appointment._id,
            amount: doctor.consultationFee,
            paymentMethod: ['Stripe', 'UPI', 'Wallet', 'Credit Card', 'Debit Card'][i % 5],
            status: 'Success',
            createdAt: appointmentDate,
          });

          appointment.paymentRef = payment._id;
          await appointment.save();
        }

        // If Completed, seed Prescription and Review
        if (status === 'Completed') {
          // 1. Prescription
          const prescriptionMeds = [
            medicinesList[i % medicinesList.length],
            medicinesList[(i + 2) % medicinesList.length],
          ];

          const prescription = await Prescription.create({
            appointmentId: appointment._id,
            doctorId: doctor._id,
            patientId: patient._id,
            medicines: prescriptionMeds,
            notes: 'Continue diet guidelines and drink plenty of water.',
            advice: 'Rest well and follow up in a week if symptoms persist.',
            pdfUrl: `http://localhost:5000/uploads/prescriptions/mock_prescription_${appointment._id}.pdf`,
            createdAt: appointmentDate,
          });

          // 2. Review
          const starRating = 4 + (i % 2); // 4 or 5 stars
          const reviewText = reviewsTexts[i % reviewsTexts.length];
          await Review.create({
            patientId: patient._id,
            doctorId: doctor._id,
            rating: starRating,
            reviewText,
            createdAt: appointmentDate,
          });

          // Update doctor ratings
          doctor.totalReviews += 1;
          doctor.rating = Number(((doctor.rating * (doctor.totalReviews - 1) + starRating) / doctor.totalReviews).toFixed(1));
          await doctor.save();
        }
      } catch (err) {
        // Skip double-booking conflicts during seed loop silently
      }
    }
    console.log(`Successfully seeded ${appointmentCount} appointments with payments/prescriptions.`);

    // 6. Availability Slots (Future slots for approved doctors)
    console.log('Seeding future availability slots (next 7 days)...');
    let slotCount = 0;
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    for (let d = 0; d < 15; d++) {
      const doctor = approvedDoctors[d];
      for (let day = 1; day <= 7; day++) {
        const slotDate = new Date();
        slotDate.setDate(now.getDate() + day);
        slotDate.setHours(0, 0, 0, 0);

        for (const slotTime of timeSlots) {
          try {
            await AvailabilitySlot.create({
              doctorId: doctor._id,
              date: slotDate,
              timeSlot: slotTime,
              isBooked: false,
            });
            slotCount++;
          } catch (err) {
            // ignore
          }
        }
      }
    }
    console.log(`Seeded ${slotCount} future availability slots.`);

    // 7. Audit Logs
    console.log('Seeding audit logs...');
    await AuditLog.create({
      userId: superAdminUser._id,
      action: 'UPDATE_SETTINGS',
      details: 'Super Admin updated global consultation commission rates to 10%',
      ipAddress: '127.0.0.1',
    });
    await AuditLog.create({
      userId: adminUser._id,
      action: 'APPROVED_DOCTOR',
      details: 'Approved Dr. John Smith credential review.',
      ipAddress: '127.0.0.1',
    });
    console.log('Audit logs seeded.');

    console.log('\n==================================================');
    console.log('SEED PROCESS FULLY COMPLETED');
    console.log('Super Admin:  superadmin@mediconnect.com / Admin@123');
    console.log('Admin:        admin@mediconnect.com / Admin@123');
    console.log('Doctor 1:     doctor1@mediconnect.com / Admin@123');
    console.log('Patient 1:    patient1@mediconnect.com / Admin@123');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeder failed with error:', error.message);
    process.exit(1);
  }
};

runSeeder();
