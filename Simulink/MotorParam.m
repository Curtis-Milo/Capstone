w_rpm = 300; %RPM
M= 5; %kg
r_w= 0.05; %m
mu = 0.8; 
g = 9.8; %m/s^2
e_max= 18; %V
incline =0; %rad
%Control Stuff
Kp = 1;
Ki = 1;
w_ref = w_rpm*(pi/30);%Rad/s
d_min = 1;
t_loss = 0;

%Motor Parameters
R = 2.0;                % Ohms
L = 0.5;                % Henrys
Km = 1;               % torque constant
Kb = 1;               % back emf constant
Kf = 0.2;               % Nms
J = 0.02;               % kg.m^2/s^2
